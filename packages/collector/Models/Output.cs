using NetworkMonitorCollector;

public class Output
{
  public required OutputType Type { get; set; }
  public string? Message { get; set; }
  public DateTimeOffset? Timestamp { get; set; }
  public IReadOnlyList<ProcessTraffic>? Processes {get; set;}
}
