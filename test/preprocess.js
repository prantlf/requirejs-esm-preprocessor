import { equal } from 'node:assert'
import tehanu from 'tehanu'
import { preprocess } from '../src/index.js'

const test = tehanu(import.meta.filename)

const { warn } = console
test.before(() => (console.warn = () => {}))
test.after(() => (console.warn = warn))

test('transforms valid content', () =>
  equal(
    preprocess({ path: 'test.js', contents: 'test', useStrict: false }),
    `define(function () {
  test;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuanMiXSwibmFtZXMiOlsidGVzdCJdLCJtYXBwaW5ncyI6IjtFQUFBQSIsImZpbGUiOiJ0ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsidGVzdCJdfQ==`
  ))

test('returns original content if transformation fails', () =>
  equal(preprocess({ path: 'test.js', contents: 'new', useStrict: false }), 'new'))
