import React from 'react';

export class Tabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeTab: props.activeTab || props.tabs[0].id || null };
    this.handleTabSelect = this.handleTabSelect.bind(this);
  }

  handleTabSelect(event, tab) {
    this.setState({ activeTab: tab.id });
    event.preventDefault();
  }

  render() {
    let activeTab = null;
    React.Children.forEach(this.props.children, (child) => {
      if (child.props.id === this.state.activeTab) {
        activeTab = child;
      }
    });
    return (
      <div className="taboo-container">
        <div className="taboo-tab-bar">
          {this.props.tabs.map(
            (tab) =>
              tab.visible === true || tab.visible === undefined ? (
                <a
                  key={tab.id}
                  href="#"
                  onClick={(event) => this.handleTabSelect(event, tab)}
                  className={`taboo-tab${tab.id === this.state.activeTab ? ' taboo-tab-active' : ''}`}
                >
                  {tab.title}
                </a>
              ) : null
          )}
        </div>
        <div className="taboo-content">{activeTab}</div>
      </div>
    );
  }
}
