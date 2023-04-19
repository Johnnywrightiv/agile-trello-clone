import BoardsView from '../containers/Boards/BoardsView';
import NonAuthView from './NonAuthView';
import { useSelector } from 'react-redux';

function HomePage() {
  const userIsLoggedIn = useSelector((state) => state.userAuth.isLoggedIn);

  return (
    <>
      { userIsLoggedIn ? <BoardsView /> : <NonAuthView /> }
    </>
  )
}

export default HomePage;
