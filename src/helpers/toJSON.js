// @flow
import { ReactTestInstance } from 'react-test-renderer';

type ReactTestInstanceJSON = {
  type: string,
  props: { [propName: string]: any },
  children: null | Array<ReactTestInstanceJSON>,
  $$typeof?: Symbol,
};

type ToJSONOptions = {
  omitProps: Array<string>,
};

export type ToJSON = (
  instance: ReactTestInstance,
  options?: ToJSONOptions
) => ReactTestInstanceJSON;

const toJSON: ToJSON = (
  { _fiber: { stateNode = null } = {} } = {},
  options = {}
) => {
  if (!stateNode) {
    return null;
  } else if (
    stateNode.rootContainerInstance &&
    stateNode.rootContainerInstance.children.length === 0
  ) {
    return null;
  }

  return _toJSON(stateNode, options);
};

const _toJSON: ToJSON = (inst, { omitProps = [] }) => {
  if (inst.isHidden) {
    // Omit timed out children from output entirely. This seems like the least
    // surprising behavior. We could perhaps add a separate API that includes
    // them, if it turns out people need it.
    return null;
  }
  switch (inst.tag) {
    case 'TEXT':
      return inst.text;
    case 'INSTANCE': {
      // We don't include the `children` prop in JSON.
      // Instead, we will include the actual rendered children.
      // eslint-disable-next-line no-unused-vars
      const { children, ...props } = inst.props;

      // Convert all children to the JSON format
      const renderedChildren = inst.children.map((child) => {
        return _toJSON(child, { omitProps });
      });

      // Function props get noisy in debug output, so we'll exclude them
      // Also exclude any props configured via options.omitProps
      let renderedProps = {};
      Object.keys(props).filter((name) => {
        if (typeof props[name] !== 'function' && !omitProps.includes(name)) {
          renderedProps[name] = props[name];
        }
      });

      const json = {
        type: inst.type,
        props: renderedProps,
        children: renderedChildren,
      };

      Object.defineProperty(json, '$$typeof', {
        value: Symbol.for('react.test.json'),
      });
      return json;
    }
    default:
      throw new Error(`Unexpected node type in toJSON: ${inst.tag}`);
  }
};

export { toJSON };
