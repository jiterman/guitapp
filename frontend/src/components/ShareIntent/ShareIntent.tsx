import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { useUser } from '../../context/user';

const ShareIntent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const { shareIntent, hasShareIntent, isReady } = useShareIntent();
  const isNavigating = useRef(false);

  console.log('Rendering ShareIntent');
  console.log('hasShareIntent', hasShareIntent);
  console.log('shareIntent', shareIntent);
  console.log('user', user);
  console.log('isLoading', isLoading);
  console.log('pathname', pathname);
  console.log('router', router);

  useEffect(() => {
    console.log('ShareIntent useEffect');

    // Solo logueamos si está listo para no saturar la consola
    if (!isReady) return;

    console.log('hasShareIntent', hasShareIntent);
    console.log('shareIntent', shareIntent);
    console.log('user', user);
    console.log('isLoading', isLoading);
    console.log('pathname', pathname);
    console.log('router', router);
    console.log('[ShareIntent] Check - hasShareIntent:', hasShareIntent, 'Path:', pathname);

    if (!hasShareIntent) {
      // Si ya no hay intent, nos aseguramos de resetear el guard
      if (isNavigating.current) {
        console.log('[ShareIntent] Intent limpiado, reseteando guard local.');
        isNavigating.current = false;
      }
      return;
    }

    const hasFiles = shareIntent.files && shareIntent.files.length > 0;

    if (!hasFiles) {
      console.log(
        '[ShareIntent] Intent detectado pero sin archivos aún (cargando módulo nativo)...'
      );
      return;
    }

    console.log('[ShareIntent] Datos listos:', {
      type: shareIntent.type,
      file: shareIntent.files?.[0]?.path,
    });

    // Si ya disparamos la navegación para este intent, no hacemos nada más
    if (isNavigating.current) {
      return;
    }

    // Esperamos a que el usuario esté logueado
    if (!user || isLoading) {
      console.log('[ShareIntent] Esperando usuario o carga...');
      return;
    }

    // CRITICAL: Verificamos si ya estamos en la pantalla de share-intent
    // o si estamos en una pantalla de auth/carga donde no deberíamos interrumpir
    const isAlreadyInShare = pathname.includes('share-intent');
    const isExcludedScreen =
      pathname.includes('login') ||
      pathname.includes('register') ||
      pathname.includes('onboarding') ||
      pathname.includes('add-expense') ||
      pathname.includes('add-income');

    console.log('pathname', pathname);
    console.log('isAlreadyInShare', hasShareIntent);
    console.log('isExcludedScreen', shareIntent);

    if (!isAlreadyInShare && !isExcludedScreen) {
      const filePath = shareIntent.files![0].path;
      console.log('[ShareIntent] !!! Disparando navegación. Path:', filePath);

      isNavigating.current = true;
      router.push({
        pathname: '/share-intent',
        params: { sharedFilePath: filePath },
      });
    }
  }, [hasShareIntent, shareIntent, user, isLoading, pathname, router, isReady]);

  return null;
};

export default ShareIntent;
