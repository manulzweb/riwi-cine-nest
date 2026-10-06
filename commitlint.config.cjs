module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[US-(\d+)\]\s+(feat|fix|test|refactor|docs|chore):\s+(.+)$/,
      headerCorrespondence: ['ticket', 'type', 'subject'],
    },
  },
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'test', 'refactor', 'docs', 'chore']],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
  },
};
