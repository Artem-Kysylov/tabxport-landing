'use client'

// Imports 
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isPaymentPage = pathname === '/payment';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent scrolling when menu is open
    document.body.style.overflow = isMenuOpen ? 'unset' : 'hidden';
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <div className='container-custom flex items-center justify-between pt-8 relative z-50'>
        <Link href='/'>
          <Image src='/logo-dark.svg' alt='logo' width={141} height={58} />
        </Link>
        
        {isPaymentPage ? (
          <div className='text-[20px] font-semibold'>Upgrade to Pro</div>
        ) : (
          <>
            {/* Desktop Navigation */}
            <nav className='hidden md:block'>
              <ul className='flex items-center gap-10'>
                <li>
                  <Link href='/#features' className='transition-colors duration-300 ease-in-out hover:text-primary'>Why TabXport?</Link>
                </li>
                <li>
                  <Link href='/#demo' className='transition-colors duration-300 ease-in-out hover:text-primary'>See TabXport in action</Link>
                </li>
                <li>
                  <Link href='/#price-plans' className='transition-colors duration-300 ease-in-out hover:text-primary'>Unlock Productivity</Link>
                </li>
                <li>
                  <Link href='/#faq' className='transition-colors duration-300 ease-in-out hover:text-primary'>FAQ</Link>
                </li>
                <li>
                  <Link href='/#about' className='transition-colors duration-300 ease-in-out hover:text-primary'>About</Link>
                </li>
              </ul>
            </nav>

            {/* Burger Menu Button */}
            <button 
              className='md:hidden flex flex-col gap-[6px] p-2 z-50'
              onClick={toggleMenu}
              aria-label='Toggle menu'
            >
              <span className={`w-6 h-[2px] bg-secondary transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-6 h-[2px] bg-secondary transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-6 h-[2px] bg-secondary transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {!isPaymentPage && (
        <div 
          className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <nav className='h-full flex items-center justify-center'>
            <ul className='flex flex-col items-center gap-8'>
              <li>
                <Link 
                  href='/#why-tabxport' 
                  className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                  onClick={handleLinkClick}
                >
                  Why TabXport?
                </Link>
              </li>
              <li>
                <Link 
                  href='/#demo' 
                  className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                  onClick={handleLinkClick}
                >
                  See TabXport in action
                </Link>
              </li>
              <li>
                <Link 
                  href='/#features' 
                  className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                  onClick={handleLinkClick}
                >
                  Unlock Productivity
                </Link>
              </li>
              <li>
                <Link 
                  href='/#faq' 
                  className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                  onClick={handleLinkClick}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}

export default Navbar