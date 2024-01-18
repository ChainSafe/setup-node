import BaseDistribution from './base-distribution';
import {NodeInputs} from './base-models';
import DebugBuild from './debug/debug_builds';
import NightlyNodejs from './nightly/nightly_builds';
import OfficialBuilds from './official_builds/official_builds';
import RcBuild from './rc/rc_builds';
import CanaryBuild from './v8-canary/canary_builds';

enum Distributions {
  DEFAULT = '',
  CANARY = 'v8-canary',
  NIGHTLY = 'nightly',
  RC = 'rc'
}

export function getNodejsDistribution(
  installerOptions: NodeInputs
): BaseDistribution {
  const versionSpec = installerOptions.versionSpec;
  let distribution: BaseDistribution;
  if (installerOptions.debugBuild) {
    distribution = new DebugBuild(installerOptions);
  } else if (versionSpec.includes(Distributions.NIGHTLY)) {
    distribution = new NightlyNodejs(installerOptions);
  } else if (versionSpec.includes(Distributions.CANARY)) {
    distribution = new CanaryBuild(installerOptions);
  } else if (versionSpec.includes(Distributions.RC)) {
    distribution = new RcBuild(installerOptions);
  } else {
    distribution = new OfficialBuilds(installerOptions);
  }

  return distribution;
}
