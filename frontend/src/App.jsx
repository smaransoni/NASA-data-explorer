import './App.css';

import Apod from './components/Apod.jsx';
import NeoFeed from './components/NeoFeed.jsx';

function App() {
  return (
    <>
      <div className="">
        <header>
          <h1>NASA Space Explorer</h1>
        </header>
        <main>
          <Apod />
          <NeoFeed />
        </main>
      </div>
    </>
  );
}

export default App;
