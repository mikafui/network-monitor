using NetworkMonitorCollector;

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
