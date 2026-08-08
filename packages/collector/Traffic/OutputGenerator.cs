using System.Text.Json;
using System.Text.Json.Serialization;

namespace NetworkMonitorCollector;

public static class OutputGenerator
{
  private static readonly JsonSerializerOptions options = new JsonSerializerOptions
  {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
  };

  private static void GenerateOutput(Output output)
  {
    Console.WriteLine(JsonSerializer.Serialize(output, options));
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
