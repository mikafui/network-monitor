namespace NetworkMonitorCollector;

public sealed class Counter
{
  public long Sent;
  public long Received;
  public long PreviousSent;
  public long PreviousReceived;
  public string Name = "Unbekannt";
  public string? IconDataUrl;
}
