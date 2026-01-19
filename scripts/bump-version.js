const { spawnSync } = require('node:child_process');

function getCommand(base) {
	return process.platform === 'win32' ? `${base}.cmd` : base;
}

const npmCmd = getCommand('npm');

const args = process.argv.slice(2).filter(Boolean);
const bump = args[0] ?? 'patch';
const extraArgs = args.slice(1);

const result = spawnSync(npmCmd, ['version', bump, '--no-git-tag-version', '--force', ...extraArgs], {
	stdio: 'inherit',
});

process.exit(result.status ?? 1);
