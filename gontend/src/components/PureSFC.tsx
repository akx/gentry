import React from 'react';

function PureSFC<P>(component: React.SFC<P>): React.ComponentClass<P> {
  return class extends React.PureComponent<P> {
    public render() {
      return component(this.props, this.context);
    }
  };
}

export default PureSFC;
