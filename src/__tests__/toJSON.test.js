import React from 'react';
import { Text, View } from 'react-native';
import { render } from '..';

import { toJSON } from '../helpers/toJSON';

test('it converts to json', () => {
  const testID = 'container';
  const { getByTestId } = render(
    <View>
      <View testID={testID}>
        <View>
          <Text>hello</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text onPress={jest.fn()}>world</Text>
          <Text>foo bar</Text>
        </View>
        <View />
      </View>
    </View>
  );

  expect(toJSON(getByTestId(testID))).toMatchSnapshot();
  expect(
    toJSON(getByTestId(testID), { omitProps: ['style'] })
  ).toMatchSnapshot();
});

test('it handles no arguments', () => {
  expect(toJSON()).toBeNull();
});

test('it handles hidden nodes', () => {
  expect(toJSON({ _fiber: { stateNode: { isHidden: true } } })).toBeNull();
});

test('it handles invalid nodes', () => {
  expect(() => toJSON({ _fiber: { stateNode: { tag: 'FAKE' } } })).toThrow();
});
