namespace NetworkMonitorCollector;

public sealed class ProcessTraffic
{
    public int Pid { get; init; }
    public string Name { get; init; } = "Unbekannt";
    public string? IconDataUrl { get; init; }
    public long SentBytes { get; set; }
    public long ReceivedBytes { get; set; }
    public double UploadRate { get; set; }
    public double DownloadRate { get; set; }
    public long TotalBytes => SentBytes + ReceivedBytes;
}
