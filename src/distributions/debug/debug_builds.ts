import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import {Octokit} from '@octokit/rest';
import BaseDistribution from '../base-distribution';
import {INodeVersion, NodeInputs} from '../base-models';

export default class DebugBuild extends BaseDistribution {
  private octokit: Octokit;
  private versions?: INodeVersion[];
  constructor(nodeInfo: NodeInputs) {
    super(nodeInfo);
    this.octokit = new Octokit({
      //   auth: process.env.GITHUB_TOKEN
    });
  }

  getDistributionUrl(): string {
    return 'https://github.com/ChainSafe/node_debug/releases/tag';
  }

  protected async getNodeJsVersions(): Promise<INodeVersion[]> {
    if (!this.versions) {
      this.versions = [];
      for await (const response of this.octokit.paginate.iterator(
        'GET /repos/{owner}/{repo}/releases',
        {
          owner: 'ChainSafe',
          repo: 'node_debug',
          per_page: 100
        }
      )) {
        this.versions.push(
          ...response.data.map(release => {
            return {
              version: release.tag_name,
              files: release.assets.map(asset => asset.name)
            };
          })
        );
      }
    }
    return this.versions;
  }

  protected checkArchitectureAndPlatform() {
    if (this.osPlat !== 'linux') {
      throw new Error('Debug builds are only available for linux platform');
    }
    if (this.nodeInfo.arch !== 'x64') {
      throw new Error('Debug builds are only available for x64 architecture');
    }
  }

  public async setupNodeJs() {
    this.checkArchitectureAndPlatform();

    
  }

  private async resolveVersion() {
    let manifest: tc.IToolRelease[] | undefined;
    let nodeJsVersions: INodeVersion[] | undefined;

    if (this.isLtsAlias(this.nodeInfo.versionSpec)) {
      core.info('Attempt to resolve LTS alias from manifest...');

      // No try-catch since it's not possible to resolve LTS alias without manifest
      manifest = await this.getManifest();

      this.nodeInfo.versionSpec = this.resolveLtsAliasFromManifest(
        this.nodeInfo.versionSpec,
        this.nodeInfo.stable,
        manifest
      );
    }
  }

  private isLtsAlias(versionSpec: string): boolean {
    return versionSpec.startsWith('lts/');
  }

  private getManifest(): Promise<tc.IToolRelease[]> {
    core.debug('Getting manifest from actions/node-versions@main');
    return tc.getManifestFromRepo(
      'actions',
      'node-versions',
      this.nodeInfo.auth,
      'main'
    );
  }

  private isLatestSyntax(versionSpec): boolean {
    return ['current', 'latest', 'node'].includes(versionSpec);
  }
  //   protected getNodejsDistInfo(version: string) {
  //     const osArch: string = this.translateArchToDistUrl(this.nodeInfo.arch);
  //     if (osArch !== "x64") {
  //         throw new Error("Debug builds are only available for x64 architecture")
  //     }

  //     version = semver.clean(version) || '';
  //     const fileName: string =
  //       this.osPlat == 'win32'
  //         ? `node-v${version}-win-${osArch}`
  //         : `node-v${version}-${this.osPlat}-${osArch}`;
  //     const urlFileName: string =
  //       this.osPlat == 'win32' ? `${fileName}.7z` : `${fileName}.tar.gz`;
  //     const initialUrl = this.getDistributionUrl();
  //     const url = `${initialUrl}/v${version}/${urlFileName}`;

  //     return <INodeVersionInfo>{
  //       downloadUrl: url,
  //       resolvedVersion: version,
  //       arch: osArch,
  //       fileName: fileName
  //     };
  //   }
}
