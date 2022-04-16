import {ModuleAst, ProgramAst} from '../parser';

export function prune(ast: ProgramAst): ProgramAst {
  new Prunner(ast).prune();
  return ast;
}

class Prunner {
  private readonly ast: ProgramAst;
  private readonly referenced: Map<string, Set<string>>;

  constructor(ast: ProgramAst) {
    this.ast = ast;
    this.referenced = new Map();
  }

  prune() {
    this.trackReferenced(this.ast.entrypoint);
    for (const lib of this.ast.libs) {
      this.trackReferenced(lib);
    }

    this.removeUnreferenced(this.ast.entrypoint);
    for (const lib of this.ast.libs) {
      this.removeUnreferenced(lib);
    }
  }

  trackReferenced(mod: ModuleAst<any>) {
    for (const use of mod.uses) {
      if (!this.referenced.has(use.path)) {
        this.referenced.set(use.path, new Set());
      }
      const names = this.referenced.get(use.path);
      if (names) {
        use.names.forEach(name => names.add(name));
      }
    }
  }

  removeUnreferenced(mod: ModuleAst<any>) {
    const referenced = this.referenced.get(mod.path);
    if (referenced) {
      mod.procs = mod.procs.filter(proc => referenced.has(proc.name));
    }
  }
}