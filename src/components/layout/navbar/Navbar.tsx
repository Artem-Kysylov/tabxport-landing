// Imports 
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Navbar = () => {
  return (
    <div className='container-custom flex items-center justify-between pt-8'>
      <Image src='/logo-dark.svg' alt='logo' width={141} height={58} />
      <nav>
        <ul className='flex items-center gap-10'>
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
  )
}

export default Navbar