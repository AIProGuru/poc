import { Container } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Notfound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div
      className="h-full bg-[#0B0C14] overflow-y-auto bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/bg-optimized.png')",
        backgroundSize: "100%",
        backgroundPosition: "center top 000px",
      }}
    >   
    <Header/>
    
      <Container>
      <div className='my-14 flex flex-col text-[#6C9BE0] justify-center items-center'>
     <img src='/404.png' height={312} width={837} className=' '></img>
      <p className="text-[64px] font-poppins font-bold text-white text-center mt-4">Oops! Page Not Found
      </p>
      <p>
      Here’s how we can help you get back on track:
      </p>
      <p>
      Go to our <span><a href='/' className=' text-[#002FFF] underline'>Homepage</a></span>.
      </p>
      <p>
      Use the search bar to find what you’re looking for.
            </p>
            <p>
If you believe this is an error, <span><a href='/contact' className=' text-[#002FFF] underline'>Contact Us </a></span> for assistance.
            </p><p className='mt-5'>
            Don't worry; even the best explorers lose their way sometimes!
                        </p>

      {/* <button
        className="mt-6 px-6 py-2 bg-blue-600 text-white text-lg rounded hover:bg-blue-700 transition duration-300"
        onClick={handleGoBack}
      >
        Go Back Home
      </button> */}
      </div>
     </Container>

     <Footer/>
    </div>
  );
}