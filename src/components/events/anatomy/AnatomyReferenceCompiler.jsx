import ReferenceCompiler from '../../general/ReferenceCompiler';
import { anatomyReferenceCompilerConfig } from './referenceCompilerConfig';

export default function AnatomyReferenceCompiler() {
  return <ReferenceCompiler config={anatomyReferenceCompilerConfig} />;
}
