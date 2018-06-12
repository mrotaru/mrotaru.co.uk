import { h } from 'preact'

const GitHubBadge = ({ handle }) => {
  return <iframe
    src={`https://githubbadge.appspot.com/${handle}?a=0`}
    style='border: 0;height: 142px;width: 200px;overflow: hidden;'>
  </iframe>
}

export default GitHubBadge;
