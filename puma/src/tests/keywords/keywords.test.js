import fncs from '../../utils/tests/tests.utils';

test('sanitazer function test 1', () => {
  expect(fncs.sanitazeValue('494219aq')).toBe('aq');
});

test('sanitazer function test 2', () => {
  expect(fncs.sanitazeValue('pals  n23  ,56;fq  cbu $%_')).toBe('palsn;fqcbu');
});

test('sanitazer function test 3', () => {
  expect(fncs.sanitazeValue('494219')).toBe('');
});

test('sanitazer function test 4', () => {
  expect(fncs.sanitazeValue('')).toBe('');
});

test('sanitazer function test 5', () => {
  expect(fncs.sanitazeValue('0')).toBe('');
});

test('split function test 1', () => {
  expect(fncs.splitValue('')).toEqual([]);
});

test('split function test 2', () => {
  expect(fncs.splitValue('palavra 1; palavra 2')).toEqual(['palavra 1', ' palavra 2']);
});
