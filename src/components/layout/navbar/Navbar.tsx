'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, History, LogIn, LogOut, Sparkles, X } from 'lucide-react'
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
  /** Standalone / dark navbar: light icons on avatar trigger */
  toolbarSurface?: 'default' | 'on-dark';
}

function NavbarAccountRow({
  layout,
  onDrawerAction,
  onRequestUpgrade,
  toolbarSurface = 'default',
}: NavbarAccountRowProps) {
  const { user, isAuthenticated, signOut, loading } = useGoogleAuth();
  const { isPro, isLoading: isProLoading, hasKnownProPurchase } = usePro();
  /** Pro badge stays stable during hydration and silent subscription refetches. */
  const effectiveIsPro = isPro || (hasKnownProPurchase && isProLoading);
  const { openGoogleAuthPopup } = useGoogleAuthUi();
  const isToolbar = layout === 'toolbar';

  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
  const toolbarMenuRef = useRef<HTMLDivElement>(null);
  const toolbarCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToolbarCloseTimer = () => {
    if (toolbarCloseTimerRef.current) {
      clearTimeout(toolbarCloseTimerRef.current);
      toolbarCloseTimerRef.current = null;
    }
  };

  const openToolbarMenu = () => {
    clearToolbarCloseTimer();
    setToolbarMenuOpen(true);
  };

  const scheduleCloseToolbarMenu = () => {
    clearToolbarCloseTimer();
    toolbarCloseTimerRef.current = setTimeout(() => setToolbarMenuOpen(false), 140);
  };

  useEffect(() => () => clearToolbarCloseTimer(), []);

  useEffect(() => {
    if (!toolbarMenuOpen || !isToolbar) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setToolbarMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [toolbarMenuOpen, isToolbar]);

  useEffect(() => {
    if (!toolbarMenuOpen || !isToolbar) return;
    const handlePointerDown = (event: PointerEvent) => {
      const root = toolbarMenuRef.current;
      if (!root?.contains(event.target as Node)) setToolbarMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [toolbarMenuOpen, isToolbar]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      try {
        localStorage.setItem('tx_export_destination', 'local');
      } catch {
        // ignore
      }
      setToolbarMenuOpen(false);
      onDrawerAction?.();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const avatarUrl = user ? getGoogleUserAvatarUrl(user) : null;
  const displayName = user ? getGoogleUserDisplayName(user) : '';

  const menuLinkClass =
    'flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[13px] font-medium text-secondary transition-colors hover:bg-secondary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25';

  const menuDangerClass =
    'flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[13px] font-medium text-secondary/75 transition-colors hover:bg-red-500/[0.07] hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/25';

  const toolbarTriggerTone =
    toolbarSurface === 'on-dark'
      ? 'text-white/90 hover:bg-white/10 focus-visible:ring-white/35'
      : 'text-secondary hover:bg-secondary/5 focus-visible:ring-primary/30';

  const toolbarChevronTone =
    toolbarSurface === 'on-dark' ? 'text-white/55' : 'text-secondary/45';

  const toolbarAvatarRing =
    toolbarSurface === 'on-dark' ? 'ring-white/25' : 'ring-secondary/10';

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
    const upgradeButtonToolbar =
      !effectiveIsPro && !isProLoading ? (
        <button
          type="button"
          onClick={() => onRequestUpgrade()}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-[8px] bg-primary px-2 py-1 text-[11px] font-semibold text-white shadow-primary-btn transition-all duration-200 ease-out hover:-translate-y-px hover:bg-primary/90 hover:shadow-primary-btn-hover sm:py-1.5 sm:text-xs"
        >
          <Sparkles size={12} />
          Upgrade to Pro
        </button>
      ) : null;

    const upgradeButtonDrawer =
      !effectiveIsPro && !isProLoading ? (
        <button
          type="button"
          onClick={() => {
            onRequestUpgrade();
            onDrawerAction?.();
          }}
          className="inline-flex cursor-pointer items-center gap-1 rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-white shadow-primary-btn transition-all duration-200 ease-out hover:-translate-y-px hover:bg-primary/90 hover:shadow-primary-btn-hover"
        >
          <Sparkles size={14} />
          Upgrade to Pro
        </button>
      ) : null;

    return (
      <div
        className={
          isToolbar
            ? 'flex min-w-0 max-w-[min(100%,440px)] items-center gap-2 sm:gap-2.5'
            : 'flex w-full max-w-[280px] flex-col items-center gap-3'
        }
      >
        {isToolbar ? (
          <>
            {upgradeButtonToolbar}
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              {effectiveIsPro ? (
                <span className="shrink-0 transition-opacity duration-200 ease-out">
                  <ProBadge variant="badge" />
                </span>
              ) : null}
              <div
                ref={toolbarMenuRef}
                className="relative shrink-0"
                onMouseEnter={openToolbarMenu}
                onMouseLeave={scheduleCloseToolbarMenu}
              >
                <button
                  type="button"
                  onClick={() => setToolbarMenuOpen((open) => !open)}
                  aria-expanded={toolbarMenuOpen}
                  aria-haspopup="menu"
                  aria-label={`Account menu, signed in as ${displayName}`}
                  className={`flex cursor-pointer items-center gap-1 rounded-[8px] py-1 pl-1 pr-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 ${toolbarTriggerTone}`}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Google avatar URLs are external OAuth assets
                    <img
                      src={avatarUrl}
                      alt=""
                      className={`h-8 w-8 shrink-0 rounded-full object-cover ring-1 ${toolbarAvatarRing}`}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <ChevronDown
                    size={15}
                    strokeWidth={2}
                    aria-hidden
                    className={`shrink-0 transition-transform duration-200 ${toolbarChevronTone} ${toolbarMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`absolute right-0 top-full z-[100] min-w-[12.5rem] pt-1.5 transition-[opacity,transform] duration-150 ease-out ${
                    toolbarMenuOpen
                      ? 'pointer-events-auto visible translate-y-0 scale-100 opacity-100'
                      : 'pointer-events-none invisible -translate-y-0.5 scale-[0.98] opacity-0'
                  }`}
                  onMouseEnter={openToolbarMenu}
                  onMouseLeave={scheduleCloseToolbarMenu}
                  role="presentation"
                >
                  <div
                    role="menu"
                    aria-hidden={!toolbarMenuOpen}
                    className="rounded-[8px] border border-secondary/12 bg-white py-1 shadow-lg shadow-black/[0.08] ring-1 ring-black/[0.04]"
                  >
                    <div className="border-b border-secondary/8 px-2.5 py-2">
                      <p className="truncate text-xs font-semibold text-secondary">{displayName}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        role="menuitem"
                        href="/history"
                        className={menuLinkClass}
                        onClick={() => {
                          setToolbarMenuOpen(false);
                          clearToolbarCloseTimer();
                        }}
                      >
                        <History size={15} strokeWidth={2} className="shrink-0 text-secondary/55" aria-hidden />
                        Export History
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuDangerClass}
                        onClick={() => void handleSignOut()}
                      >
                        <LogOut size={15} strokeWidth={2} className="shrink-0 opacity-70" aria-hidden />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {effectiveIsPro ? (
              <span className="transition-opacity duration-200 ease-out">
                <ProBadge variant="badge" />
              </span>
            ) : null}
            <div className="flex flex-col items-center gap-2">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Google avatar URLs are external OAuth assets
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-12 w-12 rounded-full object-cover ring-1 ring-secondary/15"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <span className="text-center text-sm font-medium text-secondary">{displayName}</span>
            </div>
            <div className="flex w-full max-w-[220px] flex-col gap-1 rounded-[8px] border border-secondary/12 bg-secondary/[0.03] p-1">
              <Link
                href="/history"
                className={menuLinkClass}
                onClick={() => onDrawerAction?.()}
              >
                <History size={16} strokeWidth={2} className="shrink-0 text-secondary/55" aria-hidden />
                Export History
              </Link>
              <button type="button" className={menuDangerClass} onClick={() => void handleSignOut()}>
                <LogOut size={16} strokeWidth={2} className="shrink-0 opacity-70" aria-hidden />
                Sign out
              </button>
            </div>
            {upgradeButtonDrawer}
          </>
        )}
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
  const { isAuthenticated, loading: authLoading } = useGoogleAuth();

  const navLinkDesktop =
    'whitespace-nowrap text-[13px] font-medium text-secondary transition-colors duration-300 ease-in-out hover:text-primary lg:text-sm';

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
                  toolbarSurface="on-dark"
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

        <div className='hidden min-w-0 flex-1 items-center justify-end gap-4 md:flex lg:gap-5'>
          <nav className="min-w-0">
            <ul className='flex flex-nowrap items-center justify-end gap-x-5 lg:gap-x-7'>
              <li>
                <Link
                  href='/#features'
                  className={navLinkDesktop}
                >
                  Why TableXport?
                </Link>
              </li>
              <li>
                <Link
                  href='/#demo'
                  className={navLinkDesktop}
                >
                  See TableXport in action
                </Link>
              </li>
              <li>
                <Link
                  href='/#price-plans'
                  className={navLinkDesktop}
                >
                  Simple Pricing
                </Link>
              </li>
              <li>
                <Link
                  href='/#faq'
                  className={navLinkDesktop}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href='/#about'
                  className={navLinkDesktop}
                >
                  About
                </Link>
              </li>
              {!authLoading && isAuthenticated && (
                <li>
                  <Link href='/features' className={navLinkDesktop}>
                    Feature Requests
                  </Link>
                </li>
              )}
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
            {!authLoading && isAuthenticated && (
              <li>
                <Link
                  href='/features'
                  className='text-[25px] font-semibold transition-colors duration-300 ease-in-out hover:text-primary'
                  onClick={handleLinkClick}
                >
                  Feature Requests
                </Link>
              </li>
            )}
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
