/*global PullToRefresh*/
PullToRefresh.init({
  mainElement: 'body',
  onRefresh: function onRefresh() {
    window.location.reload();
  }
});
