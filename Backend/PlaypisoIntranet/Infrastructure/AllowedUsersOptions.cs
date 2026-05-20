namespace PlaypisoIntranet.Infrastructure;

public class AllowedUsersOptions
{
    public List<string> ObjectIds { get; set; } = [];
    public List<string> AdminObjectIds { get; set; } = [];
}
