'use client'

// Imports 
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useStandaloneMode } from '@/hooks/useStandaloneMode'

const triggerHaptic = () => {
  if (typeof window === 'undefined') return;
  const nav = window.navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean };
  nav.vibrate?.(10);
};

const Navbar = () => {
  const isStandalone = useStandaloneMode()
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    triggerHaptic();
    setIsMenuOpen(!isMenuOpen);
    // Prevent scrolling when menu is open
    document.body.style.overflow = isMenuOpen ? 'unset' : 'hidden';
  };

  const handleLinkClick = () => {
    triggerHaptic();
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  if (isStandalone) {
    return (
      <div className='standalone-navbar sticky top-0 z-50 border-b border-white/10'>
        <div className='container-custom flex items-center justify-between py-4'>
          <Link href='/'>
            <Image src='/logo-light.svg' alt='logo' width={141} height={58} />
          </Link>
          <span className='text-sm font-medium text-white/70'>App Mode</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='container-custom flex items-center justify-between pt-8 relative z-50'>
        <Link href='/'>
          <Image src='/logo-dark.svg' alt='logo' width={141} height={58} />
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden md:block'>
          <ul className='flex items-center gap-10'>
            <li>
              <Link href='/#features' className='transition-colors duration-300 ease-in-out hover:text-primary'>Why TableXport?</Link>
            </li>
            <li>
              <Link href='/#demo' className='transition-colors duration-300 ease-in-out hover:text-primary'>See TableXport in action</Link>
            </li>
            <li>
              <Link href='/#price-plans' className='transition-colors duration-300 ease-in-out hover:text-primary'>Simple Pricing</Link>
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
          className='md:hidden flex flex-col items-center justify-center gap-[6px] h-11 w-11 z-50'
          onClick={toggleMenu}
          aria-label='Open menu'
          aria-expanded={isMenuOpen}
        >
          <span className='w-6 h-[2px] bg-secondary' />
          <span className='w-6 h-[2px] bg-secondary' />
          <span className='w-6 h-[2px] bg-secondary' />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white z-[60] transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isMenuOpen}
      >
        {/* Close Button — layered above content, 44x44 touch target */}
        <button
          type='button'
          onClick={toggleMenu}
          aria-label='Close menu'
          className='absolute top-6 right-4 z-[70] flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary/5 active:bg-secondary/10'
          tabIndex={isMenuOpen ? 0 : -1}
        >
          <X size={28} strokeWidth={2.25} />
        </button>

        <nav className='h-full flex items-center justify-center'>
          <ul className='flex flex-col items-center gap-8'>
            <li>
              <Link 
                href='/#features' 
                className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                onClick={handleLinkClick}
              >
                Why TableXport?
              </Link>
            </li>
            <li>
              <Link 
                href='/#demo' 
                className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                onClick={handleLinkClick}
              >
                See TableXport in action
              </Link>
            </li>
            <li>
              <Link 
                href='/#price-plans' 
                className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                onClick={handleLinkClick}
              >
                Simple Pricing
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
    </>
  )
}

export default Navbar