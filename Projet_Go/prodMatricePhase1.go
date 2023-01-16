package main

import (
	"fmt"
)

//var wg = sync.WaitGroup{}

func calculUneCase(c []int, l []int, taille int, a chan int) {
	var res int
	res = 0
	for i := 0; i < taille; i++ {
		res += c[i] * l[i]
	}
	a <- res
}

func main() {
	const tailleMax = 100
	canalInt := make(chan int)
	var lignes1, colonnes1, lignes2, colonnes2, i, j, k int
	var mat1 [tailleMax][tailleMax]int
	var mat2 [tailleMax][tailleMax]int
	var mat3 [tailleMax]int
	var matProd [tailleMax][tailleMax]int

	fmt.Print("Rentrer le nombre de Lignes puis celui de colonnes de la première Matrice = ")
	fmt.Scan(&lignes1, &colonnes1)
	fmt.Print("Rentrer le nombre de Lignes puis celui de colonnes de la deuxième Matrice = ")
	fmt.Scan(&lignes2, &colonnes2)
	for colonnes1 != lignes2 {
		fmt.Print("Produit Matriciel Impossible Veuillez réessayer \n ")
		fmt.Print("Rentrer le nombre de Lignes puis celui de colonnes de la première Matrice = ")
		fmt.Scan(&lignes1, &colonnes1)
		fmt.Print("Rentrer le nombre de Lignes puis celui de colonnes de la deuxième Matrice = ")
		fmt.Scan(&lignes2, &colonnes2)
	}

	fmt.Print("Rentrer les termes de la première Matrice = ")
	for i = 0; i < lignes1; i++ {
		for j = 0; j < colonnes1; j++ {
			fmt.Scan(&mat1[i][j])
		}
	}

	fmt.Print("Rentrer les termes de la deuxième Matrice = ")
	for i = 0; i < lignes2; i++ {
		for j = 0; j < colonnes2; j++ {
			fmt.Scan(&mat2[i][j])
		}
	}

	for i = 0; i < colonnes2; i++ {
		// on récupère la colonne de la matrice 2
		for j = 0; j < lignes2; j++ {
			mat3[j] = mat2[j][i]
		}
		for k = 0; k < lignes1; k++ {
			// pour chaque ligne on effectue le calcul d'une case avec la go function
			go calculUneCase(mat1[k][:], mat3[:], lignes2, canalInt)
			matProd[k][i] = <-canalInt
			fmt.Print("Le nouveau terme calculé est :")
			fmt.Println(matProd[k][i])
			fmt.Print("\n")

		}

	}

	fmt.Println("Le Résultat de la matrice produit avec Go function  ")
	for i = 0; i < lignes1; i++ {
		for j = 0; j < colonnes2; j++ {
			fmt.Print(matProd[i][j], "\t")
		}
		fmt.Println()
	}
}
