using Microsoft.Diagnostics.Tracing.Parsers;
using Microsoft.Diagnostics.Tracing.Session;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;

namespace NetworkMonitorCollector;

public sealed class TrafficCollector : IDisposable
{
  public event Action<Exception>? Failed;

  private readonly ConcurrentDictionary<int, Counter> counters = new();
  private TraceEventSession? session;
  private Task? worker;
  private DateTime lastSnapshot = DateTime.UtcNow;
  private const string SessionName = "NetworkMonitor-Collector";

  public async Task StartAsync()
  {
    TaskCompletionSource initialized = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

    worker = Task.Run(() =>
    {
      try
      {
        session = new TraceEventSession(SessionName) { StopOnDispose = true };
        session.EnableKernelProvider(KernelTraceEventParser.Keywords.NetworkTCPIP);
        session.Source.Kernel.TcpIpSend += e => Add(e.ProcessID, e.size, true);
        session.Source.Kernel.TcpIpRecv += e => Add(e.ProcessID, e.size, false);
        session.Source.Kernel.TcpIpSendIPV6 += e => Add(e.ProcessID, e.size, true);
        session.Source.Kernel.TcpIpRecvIPV6 += e => Add(e.ProcessID, e.size, false);
        session.Source.Kernel.UdpIpSend += e => Add(e.ProcessID, e.size, true);
        session.Source.Kernel.UdpIpRecv += e => Add(e.ProcessID, e.size, false);
        session.Source.Kernel.UdpIpSendIPV6 += e => Add(e.ProcessID, e.size, true);
        session.Source.Kernel.UdpIpRecvIPV6 += e => Add(e.ProcessID, e.size, false);
        initialized.TrySetResult();
        session.Source.Process();
      }
      catch (Exception ex)
      {
        if (!initialized.TrySetException(ex))
        {
          Failed?.Invoke(ex);
        }
      }
    });

    await initialized.Task.ConfigureAwait(false);
  }

  private void Add(int pid, int bytes, bool sent)
  {
    if (pid <= 0 || bytes <= 0)
    {
      return;
    }

    Counter counter = counters.GetOrAdd(pid, CreateCounter);

    if (sent)
    {
      Interlocked.Add(ref counter.Sent, bytes);
    }
    else
    {
      Interlocked.Add(ref counter.Received, bytes);
    }
  }

  public IReadOnlyList<ProcessTraffic> Snapshot()
  {
    DateTime now = DateTime.UtcNow;
    double seconds = Math.Max((now - lastSnapshot).TotalSeconds, .1);
    lastSnapshot = now;
    List<ProcessTraffic> result = new List<ProcessTraffic>();

    foreach (var (pid, counter) in counters)
    {
      long sent = Interlocked.Read(ref counter.Sent);
      long received = Interlocked.Read(ref counter.Received);

      result.Add(new ProcessTraffic
      {
        Pid = pid,
        Name = counter.Name,
        IconDataUrl = counter.IconDataUrl,
        SentBytes = sent,
        ReceivedBytes = received,
        UploadRate = Math.Max(0, sent - counter.PreviousSent) / seconds,
        DownloadRate = Math.Max(0, received - counter.PreviousReceived) / seconds
      });

      counter.PreviousSent = sent;
      counter.PreviousReceived = received;
    }

    return result;
  }

  private static Counter CreateCounter(int pid)
  {
    try
    {
      using Process process = Process.GetProcessById(pid);
      Counter counter = new Counter { Name = process.ProcessName };
      try
      {
        string? executable = process.MainModule?.FileName;

        if (!string.IsNullOrWhiteSpace(executable))
        {
          using Icon? icon = Icon.ExtractAssociatedIcon(executable);

          if (icon is not null)
          {
            using Bitmap? bitmap = icon.ToBitmap();
            using MemoryStream stream = new MemoryStream();
            bitmap.Save(stream, ImageFormat.Png);
            counter.IconDataUrl = $"data:image/png;base64,{Convert.ToBase64String(stream.ToArray())}";
          }
        }
      }
      catch { }
      return counter;
    }
    catch
    {
      return new Counter { Name = $"PID {pid}" };
    }
  }

  public void Dispose()
  {
    session?.Dispose();
    try
    {
      worker?.Wait(1000);
    }
    catch { }
  }
}
