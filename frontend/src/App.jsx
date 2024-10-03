import './App.css';

import Apod from './components/Apod.jsx';

function App() {
  return (
    <>
      <div className="">
        <header>
          <h1>NASA Space Explorer</h1>
        </header>
        <main>
          <Apod />
        </main>
      </div>
    </>
  );
}

export default App;
