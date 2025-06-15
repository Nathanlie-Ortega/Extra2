import { FavoritesProvider } from './context/FavoritesContext';
import './App.css';
import Pages from './pages/Pages';

function App() {
  return (
    <FavoritesProvider>
      <div className="app-container"> 
        <Pages />
      </div>
    </FavoritesProvider>
  )
}

export default App;