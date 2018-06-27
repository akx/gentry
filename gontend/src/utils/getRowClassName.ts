import {Event} from '../types/api';

const getRowClassName = (event: Event, archived: boolean) => ({
  's-row': true,
  [`r-${event.type}`]: true,
  [`r-${event.level}`]: true,
  [`r-${event.type}-${event.level}`]: true,
  'r-archived': archived,
  'r-not-archived': !archived,
});

export default getRowClassName;
