const fs = require('fs');
const path = require('path');

// 确保husky目录存在
const huskyDir = path.join(__dirname, '.husky');
const huskyHelperDir = path.join(huskyDir, '_');

if (!fs.existsSync(huskyDir)) {
  fs.mkdirSync(huskyDir, { recursive: true });
}

if (!fs.existsSync(huskyHelperDir)) {
  fs.mkdirSync(huskyHelperDir, { recursive: true });
}

// 创建husky钩子文件
const preCommitPath = path.join(huskyDir, 'pre-commit');
const commitMsgPath = path.join(huskyDir, 'commit-msg');
const huskyShPath = path.join(huskyHelperDir, 'husky.sh');

const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
`;

const commitMsgContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
`;

const huskyShContent = `#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_skip_init=1
  export husky_skip_init
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (error)"
  fi

  if [ $exitCode = 127 ]; then
    echo "husky - command not found in PATH=$PATH"
  fi

  exit $exitCode
fi`;

// 写入文件
fs.writeFileSync(preCommitPath, preCommitContent.replace(/\r\n/g, '\n'), { encoding: 'utf8' });
fs.writeFileSync(commitMsgPath, commitMsgContent.replace(/\r\n/g, '\n'), { encoding: 'utf8' });
fs.writeFileSync(huskyShPath, huskyShContent.replace(/\r\n/g, '\n'), { encoding: 'utf8' });

console.log('Husky hooks setup completed successfully!'); 