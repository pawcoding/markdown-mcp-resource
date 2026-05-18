/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "!(*.ts|*.ts.snap)": "oxfmt --no-error-on-unmatched-pattern",
  "*.ts": ["oxfmt --no-error-on-unmatched-pattern"]
};
