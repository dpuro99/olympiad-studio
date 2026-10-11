import ReferenceCompiler from '../../general/ReferenceCompiler';
import { circuitLabReferenceCompilerConfig } from './referenceCompilerConfig';

export default function CircuitLabReferenceCompiler() {
  return <ReferenceCompiler config={circuitLabReferenceCompilerConfig} />;
}
