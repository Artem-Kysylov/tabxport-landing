'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LogIn, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { useStandaloneMode } from '@/hooks/useStandaloneMode'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { usePro } from '@/contexts/ProContext'
import { useGoogleAuthUi } from '@/contexts/GoogleAuthUiContext'
import { getGoogleUserAvatarUrl, getGoogleUserDisplayName } from '@/lib/google-user-profile'
import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { ProBadge } from '@/components/ui/ProBadge'

const triggerHaptic = () => {
  if (typeof window === 'undefined') return;
  const nav = window.navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean };
  nav.vibrate?.(10);
};

interface NavbarAccountRowProps {
  layout: 'toolbar' | 'drawer';
  onDrawerAction?: () => void;
  onRequestUpgrade: () => void;
}

function NavbarAccountRow({ layout, onDrawerAction, onRequestUpgrade }: NavbarAccountRowProps) {
  const { user, isAuthenticated, signOut, loading } = useGoogleAuth();
  const { isPro, isLoading: isProLoading } = usePro();
  const { openGoogleAuthPopup } = useGoogleAuthUi();
  const isToolbar = layout === 'toolbar';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      try {
        localStorage.setItem('tx_export_destination', 'local');
      } catch {
        // ignore
      }
      onDrawerAction?.();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const avatarUrl = user ? getGoogleUserAvatarUrl(user) : null;
  const displayName = user ? getGoogleUserDisplayName(user) : '';

  if (loading) {
    return (
      <div
        className={
          isToolbar
            ? 'h-9 w-24 shrink-0 animate-pulse rounded-md bg-secondary/10'
            : 'h-10 w-full max-w-[200px] animate-pulse rounded-md bg-secondary/10'
        }
        aria-hidden
      />
    );
  }

  if (isAuthenticated && user) {
    return (
      <div
        className={
          isToolbar
            ? 'flex min-w-0 max-w-[min(100%,320px)] items-center gap-2 sm:gap-3'
            : 'flex w-full max-w-[280px] flex-col items-center gap-3'
        }
      >
        <div
          className={
            isToolbar
              ? 'flex min-w-0 items-center gap-2'
              : 'flex flex-col items-center gap-2'
          }
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Google avatar URLs are external OAuth assets
            <img
              src={avatarUrl}
              alt={displayName}
              className={
                isToolbar
                  ? 'h-8 w-8 shrink-0 rounded-full object-cover'
                  : 'h-12 w-12 rounded-full object-cover'
              }
              referrerPolicy="no-referrer"
            />
          ) : null}
          <span
            className={
              isToolbar
                ? 'truncate text-xs font-medium text-secondary sm:max-w-[140px] sm:text-sm'
                : 'text-center text-sm font-medium text-secondary'
            }
          >
            {displayName}
          </span>
          {isPro && !isProLoading ? (
            <ProBadge variant="badge" />
          ) : null}
        </div>
        {!isPro && !isProLoading ? (
          <button
            type="button"
            onClick={() => {
              onRequestUpgrade();
              onDrawerAction?.();
            }}
            className={
              isToolbar
                ? 'inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md bg-primary px-2 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-md'
                : 'inline-flex cursor-pointer items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90'
            }
          >
            <Sparkles size={isToolbar ? 12 : 14} />
            Upgrade to Pro
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className={
            isToolbar
              ? 'shrink-0 cursor-pointer text-xs text-secondary/60 underline transition-colors hover:text-secondary'
              : 'cursor-pointer text-sm text-secondary/60 underline transition-colors hover:text-secondary'
          }
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        openGoogleAuthPopup();
        onDrawerAction?.();
      }}
      className={
        isToolbar
          ? 'inline-flex cursor-pointer items-center gap-2 rounded-md border border-secondary/20 bg-white px-3 py-2 text-xs font-medium text-secondary transition-colors hover:border-secondary/35 hover:bg-secondary/5 sm:text-sm'
          : 'inline-flex cursor-pointer items-center gap-2 rounded-md border border-secondary/20 bg-white px-5 py-2.5 text-sm font-medium text-secondary transition-colors hover:border-secondary/35 hover:bg-secondary/5'
      }
    >
      <LogIn size={14} className="text-secondary/70" />
      Sign in
    </button>
  );
}

const Navbar = () => {
  const isStandalone = useStandaloneMode()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const toggleMenu = () => {
    triggerHaptic();
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = isMenuOpen ? 'unset' : 'hidden';
  };

  const handleLinkClick = () => {
    triggerHaptic();
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  if (isStandalone) {
    return (
      <>
        <div className='standalone-navbar sticky top-0 z-50 border-b border-white/10'>
          <div className='container-custom flex items-center justify-between gap-3 py-4'>
            <Link href='/'>
              <Image src='/logo-light.svg' alt='logo' width={141} height={58} />
            </Link>
            <div className='flex min-w-0 flex-1 items-center justify-end gap-3'>
              <span className='hidden text-sm font-medium text-white/70 sm:inline'>App Mode</span>
              <div className='text-white [&_span]:text-white/90 [&_button]:border-white/25 [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/15'>
                <NavbarAccountRow
                  layout="toolbar"
                  onRequestUpgrade={() => setUpgradeModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
        <UpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      <div className='container-custom relative z-50 flex items-center justify-between gap-3 pt-8'>
        <Link href='/' className='shrink-0'>
          <Image src='/logo-dark.svg' alt='logo' width={141} height={58} />
        </Link>

        <div className='hidden min-w-0 flex-1 items-center justify-end gap-8 md:flex'>
          <nav>
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
          <NavbarAccountRow
            layout="toolbar"
            onRequestUpgrade={() => setUpgradeModalOpen(true)}
          />
        </div>

        <button
          className='z-50 flex h-11 w-11 flex-col items-center justify-center gap-[6px] md:hidden'
          onClick={toggleMenu}
          aria-label='Open menu'
          aria-expanded={isMenuOpen}
        >
          <span className='h-[2px] w-6 bg-secondary' />
          <span className='h-[2px] w-6 bg-secondary' />
          <span className='h-[2px] w-6 bg-secondary' />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[60] bg-white transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type='button'
          onClick={toggleMenu}
          aria-label='Close menu'
          className='absolute right-4 top-6 z-[70] flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary/5 active:bg-secondary/10'
          tabIndex={isMenuOpen ? 0 : -1}
        >
          <X size={28} strokeWidth={2.25} />
        </button>

        <nav className='flex h-full flex-col items-center overflow-y-auto px-6 pb-10 pt-20'>
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
            <li>
              <Link
                href='/#about'
                className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                onClick={handleLinkClick}
              >
                About
              </Link>
            </li>
          </ul>

          <div className='mt-auto w-full max-w-xs border-t border-secondary/10 pt-10'>
            <p className='mb-4 text-center text-xs font-semibold uppercase tracking-wide text-secondary/50'>
              Account
            </p>
            <div className='flex justify-center'>
              <NavbarAccountRow
                layout="drawer"
                onDrawerAction={handleLinkClick}
                onRequestUpgrade={() => setUpgradeModalOpen(true)}
              />
            </div>
          </div>
        </nav>
      </div>

      <UpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </>
  )
}

export default Navbar
