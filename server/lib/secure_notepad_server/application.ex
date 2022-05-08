defmodule SecureNotepadServer.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SecureNotepadServer.Options,
      SecureNotepadServer.Hybrid,
      SecureNotepadServer.Argon2w,
      SecureNotepadServer.Database.Repo,
      SecureNotepadServer.Cacher,
      {Bandit, plug: SecureNotepadServer.Endpoint, scheme: :http, options: [port: 49430]}
      # Starts a worker by calling: SecureNotepadServer.Worker.start_link(arg)
      # {SecureNotepadServer.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: SecureNotepadServer.Supervisor]
    with {:ok, pid} = Supervisor.start_link(children, opts) do
      SecureNotepadServer.Database.Repo.run_migrations()
      {:ok, pid}
    end
  end
end
