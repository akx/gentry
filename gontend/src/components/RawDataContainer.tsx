import React from 'react';

interface RawDataContainerState {
  data?: any;
  formattedData?: string;
}

class RawDataContainer extends React.PureComponent<{ data: any }, RawDataContainerState> {
  public state: RawDataContainerState = {};

  public componentDidMount() {
    this.rerenderIfNeeded();
  }

  private rerenderIfNeeded() {
    const { data } = this.props;
    if (this.state.data !== data) {
      setTimeout(() => {
        const formattedData = JSON.stringify(data, null, 2);
        this.setState({ data, formattedData });
      }, 4);
      return true;
    }
    return false;
  }

  public render() {
    if (!this.state.formattedData) {
      return <React.Fragment>Rendering...</React.Fragment>;
    }
    return (
      <div style={{ maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto' }}>
        <pre>{this.state.formattedData}</pre>
      </div>
    );
  }
}

export default RawDataContainer;
