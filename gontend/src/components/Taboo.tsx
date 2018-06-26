import React, {ReactElement} from 'react';

interface TabsState {
  activeTab: any;
}

interface Tab {
  visible?: boolean;
  id: string;
  title: string;
}

interface TabsProps {
  activeTab?: string;
  tabs: Tab[];
}

export class Tabs extends React.Component<TabsProps, TabsState> {
  constructor(props) {
    super(props);
    this.state = {activeTab: props.activeTab || props.tabs[0].id || null};
    this.handleTabSelect = this.handleTabSelect.bind(this);
  }

  public handleTabSelect(event, tab) {
    this.setState({activeTab: tab.id});
    event.preventDefault();
  }

  public render() {
    let activeTab: ReactElement<any> | undefined;
    React.Children.forEach(this.props.children, (child) => {
      const el = child as ReactElement<any>;
      if (el.props && el.props.id === this.state.activeTab) {
        activeTab = el;
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
              ) : null,
          )}
        </div>
        <div className="taboo-content">{activeTab}</div>
      </div>
    );
  }
}
