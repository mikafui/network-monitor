using System.Text.Json;
using System.Text.Json.Serialization;
using NetworkMonitorCollector;

public class OutputTypeJsonConverter : JsonConverter<OutputType>
{
  public override OutputType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
  {
    string? value = reader.GetString();

    if (value is null)
    {
      throw new JsonException("OutputType cannot be null.");
    }

    return OutputType.FromString(value);
  }

  public override void Write(Utf8JsonWriter writer, OutputType value, JsonSerializerOptions options)
  {
    writer.WriteStringValue(value.Value);
  }
}
