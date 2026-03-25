'use client'

// Imports 
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SlSocialLinkedin } from "react-icons/sl"
import { FaXTwitter } from "react-icons/fa6"
import { InstallAppButton } from '@/components/pwa/InstallAppButton'
import { useStandaloneMode } from '@/hooks/useStandaloneMode'

const Footer = () => {
  const isStandalone = useStandaloneMode()

  if (isStandalone) {
    return (
      <footer className='standalone-footer py-5'>
        <div className='container-custom'>
          <div className='flex flex-col items-center gap-4 text-center'>
            <div className='flex items-center gap-6 text-primary text-2xl'>
              <Link href='https://www.linkedin.com/in/artem-k-3392b3366/' target='_blank' rel='noopener noreferrer' className='transition-colors duration-300 ease-in-out hover:text-secondary'>
                <SlSocialLinkedin />
              </Link>
              <Link href='https://x.com/tabXport' target='_blank' rel='noopener noreferrer' className='transition-colors duration-300 ease-in-out hover:text-secondary'>
                <FaXTwitter />
              </Link>
            </div>
            <a href="mailto:hello@tablexport.com" className='text-primary font-semibold text-base hover:text-secondary transition-colors duration-300 ease-in-out'>hello@tablexport.com</a>
            <span className='text-sm text-secondary opacity-60'>Proudly Indie-Built</span>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className='bg-secondary py-8'>
      <div className='container-custom'>
        <div className='flex flex-col items-center gap-8'>
          {/* Logo and Navigation */}
          <div className='flex flex-col md:flex-row md:items-center md:justify-between w-full items-center'>
            <div className='mb-8 md:mb-0'>
              <Link href='/'>
                <Image 
                  src='/logo-light.svg' 
                  alt='logo' 
                  width={141} 
                  height={58} 
                />
              </Link>
            </div>

            <nav className='w-full md:w-auto'>
              <ul className='flex flex-col md:flex-row items-center gap-6 md:gap-10 text-white'>
                <li>
                  <Link href='/#why-tabxport' className='transition-colors duration-300 ease-in-out hover:text-primary'>Why TableXport?</Link>
                </li>
                <li>
                  <Link href='/#demo' className='transition-colors duration-300 ease-in-out hover:text-primary'>See TableXport in action</Link>
                </li>
                <li>
                  <Link href='/#features' className='transition-colors duration-300 ease-in-out hover:text-primary'>Unlock Productivity</Link>
                </li>
                <li>
                  <Link href='/#faq' className='transition-colors duration-300 ease-in-out hover:text-primary'>FAQ</Link>
                </li>
                <li>
                  <Link href='/#about' className='transition-colors duration-300 ease-in-out hover:text-primary'>About</Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Social and Email */}
          <div className='flex flex-col md:flex-row md:items-center md:justify-between w-full items-center gap-6 md:gap-0'>
            <div className='flex items-center gap-8 text-primary text-2xl order-2 md:order-1'>
              <Link href='https://www.linkedin.com/in/artem-k-3392b3366/' target='_blank' rel='noopener noreferrer' className='transition-colors duration-300 ease-in-out hover:text-white'>
                <SlSocialLinkedin />
              </Link>
              <Link href='https://x.com/tabXport' target='_blank' rel='noopener noreferrer' className='transition-colors duration-300 ease-in-out hover:text-white'>
                <FaXTwitter />
              </Link>
            </div>

            <a href="mailto:hello@tablexport.com" className='text-primary font-semibold text-[1.5625rem] cursor-pointer order-1 md:order-2 hover:text-white transition-colors duration-300 ease-in-out'>hello@tablexport.com</a>
          </div>

          {/* Bottom Links */}
          <div className='flex flex-col md:flex-row items-center gap-4 md:gap-0 md:justify-between text-white text-sm font-normal w-full'>
            <div className='flex flex-col md:flex-row items-center gap-5 md:gap-5'>
              <Link href='/privacy' className='transition-colors duration-300 ease-in-out hover:text-primary'>Privacy policy</Link>
              <Link href='/terms' className='transition-colors duration-300 ease-in-out hover:text-primary'>Terms of Service</Link>
              <Link href='/refund' className='transition-colors duration-300 ease-in-out hover:text-primary'>Refund Policy</Link>
              <InstallAppButton />
              {/* <Link href='https://tablexport.gitbook.io/tablexport-docs/wkbciB0ogW3EFOM5Gwhg/' target='_blank' className='transition-colors duration-300 ease-in-out hover:text-primary'>Documentation</Link> */}
            </div>
            <span className='mt-5 md:mt-0 opacity-60'>Proudly Indie-Built</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer