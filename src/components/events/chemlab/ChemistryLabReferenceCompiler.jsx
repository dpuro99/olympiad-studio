import ReferenceCompiler from '../../general/ReferenceCompiler';
import { chemistryLabReferenceCompilerConfig } from './referenceCompilerConfig';

export default function ChemistryLabReferenceCompiler() {
  return <ReferenceCompiler config={chemistryLabReferenceCompilerConfig} />;
}
