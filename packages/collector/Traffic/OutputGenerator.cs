using System.Text.Json;
using System.Text.Json.Serialization;

namespace NetworkMonitorCollector;

public static class OutputGenerator
{
  private static readonly object writerLock = new object();
  private static TextWriter writer = Console.Out;
  private static readonly JsonSerializerOptions options = new JsonSerializerOptions
  {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
  };

  public static void SetWriter(TextWriter outputWriter)
  {
    writer = outputWriter;
  }

  private static void GenerateOutput(Output output)
  {
    string json = JsonSerializer.Serialize(output, options);

    lock (writerLock)
    {
      writer.WriteLine(json);
      writer.Flush();
    }
  }

  public static void GenerateReady()
  {
    Output output = new Output
    {
      Type = OutputType.Ready,
      Timestamp = DateTimeOffset.Now
    };

    GenerateOutput(output);
  }

  public static void GenerateSnapshot(IReadOnlyList<ProcessTraffic> processes)
  {
    Output output = new Output
    {
      Type = OutputType.Snapshot,
      Timestamp = DateTimeOffset.Now,
      Processes = processes
    };

    GenerateOutput(output);
  }

  public static void GenerateError(Exception ex)
  {
    Output output = new Output
    {
      Type = OutputType.Error,
      Message = ex.Message,
      Timestamp = DateTimeOffset.Now
    };

    GenerateOutput(output);
  }
}
