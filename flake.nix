{
  description = "lux-node-developer-environment";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    mypinned-nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
  };

  outputs = { self, flake-utils, mypinned-nixpkgs }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import mypinned-nixpkgs {
          inherit system;
        };
      in
      {
        # enables use of `nix shell`
        devShell = pkgs.mkShell {
          # add things you want in your shell here
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.typescript
            nodePackages.grunt-cli
            nodePackages_latest.rollup
            (yarn.override { nodejs = nodejs_20; })
          ];
          shellHook = ''
            yarn config set prefix ~/.yarn
            yarn config set cache-folder ~/.yarn-cache
            export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
            '';
        };
      }
    );
}
