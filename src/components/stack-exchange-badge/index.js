import { h } from 'preact'

const StackExchangeBadge = ({ fullName, userId, tab = 'accounts' }) => {
  return <a
    href={`https://stackexchange.com/users/${userId}?tab=${tab}`}>
    <img
      src={`http://stackexchange.com/users/flair/${userId}.png`}
      width='208'
      height='58'
      alt={`profile for ${fullName} on Stack Exchange, a network of free, community-driven Q&A sites`}
      title={`profile for ${fullName} on Stack Exchange, a network of free, community-driven Q&A sites`}
    />
  </a>
}

export default StackExchangeBadge;
