defmodule SecureNotepadServer.Options do
  use Agent

  def start_link(_) do
    state = Path.join(:code.priv_dir(:secure_notepad_server), "config.json")
    |> File.read!
    |> Poison.decode!
    Agent.start_link(fn -> state end, name: __MODULE__)
  end

  def get do
    Agent.get(__MODULE__, & &1)
  end

  def remoteip_proxies do
    header_name = get()["real_ip_header"]
    if is_binary(header_name) do
      [header_name]
    else
      []
    end
  end

  def ratelimit_options do
    reqs_per_minute =
      get()["max_requests_per_minute"]
      |> SecureNotepadServer.Argon2w.try_parse_int
    [
      rate_limit: {"a_request", 60_000, reqs_per_minute},
      by: :ip
    ]
  end
end
