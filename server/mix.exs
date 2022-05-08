defmodule SecureNotepadServer.MixProject do
  use Mix.Project

  def project do
    [
      app: :secure_notepad_server,
      version: "0.1.0",
      elixir: "~> 1.13",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {SecureNotepadServer.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:bandit, "~> 0.4.3"},
      {:plug, "~> 1.13"},
      {:poison, "~> 5.0"},
      {:apoc, github: "thooton/apoc", tag: "v0.2.2"},
      {:ecto, "~> 3.8.1"},
      {:ecto_sqlite3, "~> 0.7.4"},
      {:argon2_elixir, "~> 3.0.0"},
      {:replug, "~> 0.1.0"},
      {:remote_ip, "~> 1.0.0"},
      {:hammer, "~> 6.0"},
      {:hammer_plug, "~> 2.1.1"}
      # {:dep_from_hexpm, "~> 0.3.0"},
      # {:dep_from_git, git: "https://github.com/elixir-lang/my_dep.git", tag: "0.1.0"}
    ]
  end
end
