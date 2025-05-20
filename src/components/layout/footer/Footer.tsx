// Imports 
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SlSocialLinkedin } from "react-icons/sl"
import { FaXTwitter } from "react-icons/fa6"

const Footer = () => {
  return (
    <footer className='bg-secondary py-8'>
      <div className='container-custom'>
        <div className='flex flex-col gap-8'>
          <div className='flex items-center justify-between'>
            <Image src='/logo-light.svg' alt='logo' width={141} height={58} />

            <nav>
              <ul className='flex items-center gap-10 text-white'>
                <li>
                  <Link href='/' className='transition-colors duration-300 ease-in-out hover:text-primary'>Why TabXport?</Link>
                </li>
                <li>
                  <Link href='/' className='transition-colors duration-300 ease-in-out hover:text-primary'>See TabXport in action</Link>
                </li>
                <li>
                  <Link href='/' className='transition-colors duration-300 ease-in-out hover:text-primary'>Unlock Productivity </Link>
                </li>
                <li>
                  <Link href='/' className='transition-colors duration-300 ease-in-out hover:text-primary'>FAQ</Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center justify-center gap-8 text-primary text-2xl'>
              <Link href='/' className='transition-colors duration-300 ease-in-out hover:text-white'>
                <SlSocialLinkedin />
              </Link>
              <Link href='/' className='transition-colors duration-300 ease-in-out hover:text-white'>
                <FaXTwitter />
              </Link>
            </div>

            <p className='text-primary font-semibold text-[1.5625rem] cursor-pointer'>tabxport@gmail.com</p>
          </div>

          <div className='flex items-center justify-between text-white text-sm font-normal'>
            <Link href='/' className='transition-colors duration-300 ease-in-out hover:text-primary'>Privacy policy</Link>
            <span>Proudly Indie-Built</span>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer