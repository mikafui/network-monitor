using System.IO.Pipes;
using System.Text;
using NetworkMonitorCollector;

string? pipeName = GetArgument(args, "--pipe");

if (string.IsNullOrWhiteSpace(pipeName))
{
  Console.Error.WriteLine("--pipe wurde nicht angegeben.");
  Environment.ExitCode = 2;
  return;
}

using var pipe = new NamedPipeClientStream(".", pipeName, PipeDirection.Out, PipeOptions.Asynchronous);

try
{
  await pipe.ConnectAsync(10_000);
}
catch (Exception ex)
{
  Console.Error.WriteLine($"Pipe-Verbindung fehlgeschlagen: {ex.Message}");
  Environment.ExitCode = 1;
  return;
}

using var writer = new StreamWriter(pipe, new UTF8Encoding(false)) { AutoFlush = true };
OutputGenerator.SetWriter(writer);

using var collector = new TrafficCollector();
using var stopped = new CancellationTokenSource();

Console.CancelKeyPress += (_, e) =>
{
  e.Cancel = true;
  stopped.Cancel();
};

collector.Failed += ex =>
{
  OutputGenerator.GenerateError(ex);
  Environment.ExitCode = 1;
  stopped.Cancel();
};

try
{
  await collector.StartAsync();
}
catch (Exception ex)
{
  OutputGenerator.GenerateError(ex);
  Environment.ExitCode = 1;
  return;
}

OutputGenerator.GenerateReady();

try
{
  while (!stopped.IsCancellationRequested)
  {
    await Task.Delay(1000, stopped.Token);
    OutputGenerator.GenerateSnapshot(collector.Snapshot());
  }
}
catch (OperationCanceledException) { }
catch (IOException) { }

static string? GetArgument(string[] arguments, string name)
{
  int index = Array.IndexOf(arguments, name);
  return index >= 0 && index + 1 < arguments.Length ? arguments[index + 1] : null;
}
