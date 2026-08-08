using System.Text.Json.Serialization;

namespace NetworkMonitorCollector;

[JsonConverter(typeof(OutputTypeJsonConverter))]
public class OutputType
{
  private OutputType(string value) { Value = value; }

  public string Value { get; private set; }

  public static OutputType Error { get { return new OutputType("error"); } }
  public static OutputType Ready { get { return new OutputType("ready"); } }
  public static OutputType Snapshot { get { return new OutputType("snapshot"); } }

  public override string ToString()
  {
    return Value;
  }

  public static OutputType FromString(string value)
  {
    return value switch
    {
      "error" => Error,
      "ready" => Ready,
      "snapshot" => Snapshot,
      _ => throw new ArgumentOutOfRangeException(
        nameof(value),
        value,
        "Unknown output type.")
    };
  }
}
