{
  description = "blog.gabedunn.dev";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      perSystem =
        {
          config,
          self',
          inputs',
          pkgs,
          system,
          ...
        }:
        {
          packages = {
            blog = pkgs.buildNpmPackage {
              name = "blog.gabedunn.dev";
              src = ./.;

              npmDepsHash = "sha256-0k8OpuxgH+ZIa9bScuiQI7tPcp0cF2ImEI83KGUuljc=";

              # needed to avoid build hanging with vitepress
              # https://discourse.nixos.org/t/nix-build-of-vuepress-project-is-slow-or-hangs/56521/5
              buildPhase = ''
                npm run build > /dev/null 2>&1
              '';

              installPhase = ''
                mkdir -p $out/share
                cp -r .vitepress/dist $out/share/blog.gabedunn.dev
              '';
            };

            default = self'.packages.blog;
          };

          devShells.default = pkgs.mkShell {
            packages = with pkgs; [ nodejs_25 ];
          };
        };
    };
}
