import React from 'react';
import PropTypes from 'prop-types';
import {Responsive, WidthProvider} from 'react-grid-layout';
import BreakpointConfig from 'config/BreakpointConfig';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class Grid extends React.Component {

  static propTypes = {
    onElementResized: PropTypes.func,
  };

  static defaultProps = {
    onElementResized: () => {}
  };

  constructor(props) {
    super(props);
  }

  /**
   * The first time the grid is mounted, we don't know yet the calculated size of elements so we
   * dispatch a resize event for all of them (those events will allow to add css breakpoint properties
   * depending there size)
   *
   * We set a timeout to 0 to be sure the graphical stuff are done before calculate right data.
   * We wait 500ms to dispatch grid Ready, it is not necessary but visually nicer.
   */
  componentDidMount() {
    const widgetIds = this.props.widgets.map(w => w.key);
    this.dispatchResizeToAllWidgets(widgetIds);
    setTimeout(() => {
      this.props.onGridReady(widgetIds);
    }, 500);
  }

  getWidthClass(size) {
    return BreakpointConfig.getWidthClass(this.props.config.itemBreakpoints, size);
  }

  getHeightClass(size) {
    return BreakpointConfig.getHeightClass(this.props.config.itemBreakpoints, size);
  }

  onResizeStop(layout, oldItem, newItem, placeholder, event, htmlElement) {
    this.resizedId = htmlElement.parentElement.id;
  }

  getSizeInfo(domId) {
    const { offsetWidth, offsetHeight } = document.getElementById(domId);
    return {
      wBreakpointClass: this.getWidthClass(offsetWidth),
      hBreakpointClass: this.getHeightClass(offsetHeight),
      width: offsetWidth,
      height: offsetHeight
    }
  }

  /**
   * The timeout to 0 is necessary to be sure to have the good size.
   */
  dispatchResizeToAllWidgets(widgetIds) {
    const ids = widgetIds ? widgetIds : this.props.widgets.map(w => w.key);
    ids.forEach(wid => {
      setTimeout(() => {
        this.props.onElementResized(wid, this.getSizeInfo(wid));
      }, 0);
    });
  }

  /**
   * We need to send resize events to all widgets because all there size may have changed.
   */
  onLayoutChange(layout) {
    this.dispatchResizeToAllWidgets();
  }

  render() {
    const { layouts, breakpoints, cols, rowHeight } = this.props.config;
    return (
      <div>
        <ResponsiveReactGridLayout
          rowHeight={rowHeight}
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          onLayoutChange={this.onLayoutChange.bind(this)}
          onResizeStop={this.onResizeStop.bind(this)}
        >
          {this.props.widgets}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}
