import ReferenceCompiler from '../../general/ReferenceCompiler';
import { dynamicPlanetReferenceCompilerConfig } from './referenceCompilerConfig';

export default function DynamicPlanetReferenceCompiler() {
  return <ReferenceCompiler config={dynamicPlanetReferenceCompilerConfig} />;
}
