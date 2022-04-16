import {empty, err, ok, Optional, Result, some} from '../../lib/types';
import {AsmError} from '../base';
import {AnyModuleAst, AstImmExpr, AstInstrStmt, BlockStmt, ImmMacroStmt, ProgramAst} from '../parser';

export function expand(ast: ProgramAst): Result<ProgramAst, AsmError> {
  return new ImmExpander(ast).expand();
}

class ImmExpander {
  private readonly ast: ProgramAst;
  private readonly impls: Map<string, Map<string, ImmMacroStmt>>;

  constructor(ast: ProgramAst) {
    this.ast = ast;
    this.impls = new Map();
  }

  expand(): Result<ProgramAst, AsmError> {
    this.trackAllImpls();

    for (const mod of this.ast.libs) {
      const exp = this.expandModule(mod);
      if (exp.isErr()) return err(exp);
    }

    const exp = this.expandModule(this.ast.entrypoint);
    if (exp.isErr()) return err(exp);

    return ok(this.ast);
  }

  private trackAllImpls() {
    for (const mod of this.ast.libs) {
      this.trackImpls(mod);
    }
    this.trackImpls(this.ast.entrypoint);
  }

  private trackImpls(mod: AnyModuleAst) {
    const m: Map<string, ImmMacroStmt> = new Map();
    for (const impl of mod.imms) {
      m.set(impl.name, impl);
    }
    this.impls.set(mod.path, m);
  }

  private expandModule(mod: AnyModuleAst): Result<void, AsmError> {
    // TODO: expand imms recursively.

    for (const proc of mod.procs) {
      this.expandProc(mod, proc.impl);
    }
    
    if (mod.type == 'EntrypointAst') {
      this.expandProc(mod, mod.main);
    }

    return ok();
  }

  private expandProc(mod: AnyModuleAst, block: BlockStmt): Result<void, AsmError> {
    for (const instr of block.instrs) {
      switch (instr.type) {
        case 'JmpInstr':
        case 'JzInstr':
        case 'JnzInstr':
        case 'JgInstr':
        case 'JgzInstr':
        case 'JlInstr':
        case 'JlzInstr':
        case 'JoInstr':
        case 'JdzInstr':
        case 'PushInstr':
        case 'PopInstr':
          if (instr.op.type == 'AstImmExpr') {
            this.expandImm(mod, instr.op);
          }
          break;
        case 'StoInstr':
        case 'StobInstr':
        case 'OutInstr':
        case 'OutbInstr':
          if (instr.op1.type == 'AstImmExpr') {
            this.expandImm(mod, instr.op1);
          }
          if (instr.op2.type == 'AstImmExpr') {
            this.expandImm(mod, instr.op2);
          }
          break;
        case 'MovInstr':
        case 'LodInstr':
        case 'LodbInstr':
        case 'AddInstr':
        case 'SubInstr':
        case 'MulInstr':
        case 'DivInstr':
        case 'ModInstr':
        case 'ShlInstr':
        case 'ShrInstr':
        case 'OrInstr':
        case 'AndInstr':
        case 'XorInstr':
        case 'CmpInstr':
          if (instr.op2.type == 'AstImmExpr') {
            this.expandImm(mod, instr.op2);
          }
          break;
        case 'DataByte':
          for (const byte of instr.bytes) {
            this.expandImm(mod, byte);
          }
          break;
        case 'DataWord':
          for (const word of instr.words) {
            this.expandImm(mod, word);
          }
          break;
      }
    }
    return ok();
  }

  private expandImm(mod: AnyModuleAst, imm: AstImmExpr): Result<void, AsmError> {
    if (typeof imm.value == 'string') {
      const uses = this.usesImm(mod, imm.value);
      if (uses.isSome()) {
        imm.value = uses.unwrap().value;
        return ok();
      }

      const impl = this.implsImm(mod, imm.value);
      if (impl.isSome()) {
        imm.value = impl.unwrap().value;
        return ok();
      }
    }
    return ok();
  }

  private usesImm(mod: AnyModuleAst, name: string): Optional<AstImmExpr> {
    for (const use of mod.uses) {
      if (use.names.includes(name)) {
        return some(this.impls.get(use.path)!.get(name)!.expr);
      }
    }
    return empty();
  }

  private implsImm(mod: AnyModuleAst, name: string): Optional<AstImmExpr> {
    if (!this.impls.has(mod.path)) {
      return empty();
    }
    const impls = this.impls.get(mod.path)!;
    if (impls.has(name)) {
      return some(impls.get(name)!.expr);
    }
    return empty();
  }
}